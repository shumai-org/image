import { spawn } from "bun";
import { dlopen, FFIType, ptr, read, suffix, toArrayBuffer } from "bun:ffi";
import { existsSync } from "fs";
import * as path from "path";

function load_symbols(binding_path) {
  const { symbols } = dlopen(binding_path, {
    from_file: {
      args: [FFIType.cstring],
      returns: FFIType.ptr,
    },
    to_file: {
      args: [FFIType.ptr, FFIType.cstring],
      returns: FFIType.i32,
    },
    from_memory: {
      args: [FFIType.ptr, FFIType.u64, FFIType.i32, FFIType.i32, FFIType.i32],
      returns: FFIType.ptr,
    },
    to_memory: {
      args: [FFIType.ptr, FFIType.ptr],
      returns: FFIType.ptr,
    },
    free_memory: {
      args: [FFIType.ptr],
    },

    get_height: {
      args: [FFIType.ptr],
      returns: FFIType.i32,
    },
    get_width: {
      args: [FFIType.ptr],
      returns: FFIType.i32,
    },
    get_bands: {
      args: [FFIType.ptr],
      returns: FFIType.i32,
    },
    rotate: {
      args: [FFIType.ptr, FFIType.f64],
      returns: FFIType.ptr,
    },
    resize: {
      args: [FFIType.ptr, FFIType.f64],
      returns: FFIType.ptr,
    },
    gaussblur: {
      args: [FFIType.ptr, FFIType.f64],
      returns: FFIType.ptr,
    },
    sharpen: {
      args: [FFIType.ptr],
      returns: FFIType.ptr,
    },
    sobel: {
      args: [FFIType.ptr],
      returns: FFIType.ptr,
    },
    canny: {
      args: [FFIType.ptr],
      returns: FFIType.ptr,
    },
    invert: {
      args: [FFIType.ptr],
      returns: FFIType.ptr,
    },
  });
  return symbols;
}

async function $([args]) {
  const { stdout } = spawn(args.split(" "));
  const out = (await new Response(stdout).text()).trim();
  return out;
}

async function build_darwin(dest_path) {
  const libvips_path = await $`brew --prefix libvips`;
  const glib_path = await $`brew --prefix glib`;

  const libvips_include = `${libvips_path}/include`;
  const glib_includes = [
    `${glib_path}/include/glib-2.0`,
    `${glib_path}/lib/glib-2.0/include`,
  ];
  const libvips_lib = `${libvips_path}/lib/`;
  const glib_lib = `${glib_path}/lib/`;

  const build_cmd = `cc ${dest_path}/binding.c -I${libvips_include} -I${glib_includes[0]} -I${glib_includes[1]} -L${libvips_lib} -L${glib_lib} -lvips -lglib-2.0 -shared -o ${dest_path}/binding.${suffix}`;
  await $([build_cmd]);
  return `${dest_path}/binding.${suffix}`;
}

export async function load() {
  const dest_path = path.dirname(import.meta.resolveSync("@shumai/image"));

  if (existsSync(`${dest_path}/binding.${suffix}`)) {
    try {
      return load_symbols(`${dest_path}/binding.${suffix}`);
    } catch (e) {
      console.warn("Failed to load, rebuilding...");
    }
  }
  try {
    if (process.platform === "darwin") {
      return load_symbols(await build_darwin(dest_path));
    } else {
      throw `not yet supported`;
    }
  } catch (e) {
    throw `Unable to build bindings for ${process.platform}: ${e}`;
  }
}
