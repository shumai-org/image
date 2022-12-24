import { ptr, read, toArrayBuffer, dlopen, FFIType, suffix } from "bun:ffi";
import { spawn } from "bun";
import * as sm from '@shumai/shumai';

const { stdout } = spawn(['brew', '--prefix', 'libvips'])
const brew_path = (await new Response(stdout).text()).trim()
const libvips_path = `${brew_path}/lib/libvips.${suffix}`;

const { symbols } = dlopen(libvips_path, {
  vips_image_new_from_memory: {
    args: [FFIType.ptr, FFIType.u64, FFIType.i32, FFIType.i32, FFIType.i32, FFIType.i32],
    returns: FFIType.ptr,
  },
  vips_image_new_from_file: {
    args: [FFIType.cstring],
    returns: FFIType.ptr,
  },
  vips_image_get_width: {
    args: [FFIType.ptr],
    returns: FFIType.i32,
  },
  vips_image_get_height: {
    args: [FFIType.ptr],
    returns: FFIType.i32,
  },
  vips_image_get_bands: {
    args: [FFIType.ptr],
    returns: FFIType.i32,
  },
  vips_image_write_to_memory: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.ptr,
  },
  vips_image_write_to_file: {
    args: [FFIType.ptr, FFIType.cstring],
    returns: FFIType.i32,
  },
  vips_rotate: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.f64],
    returns: FFIType.i32,
  },
  vips_resize: {
      args: [FFIType.ptr, FFIType.ptr, FFIType.f64],
      returns: FFIType.i32,
  },
  vips_gaussblur: {
      args: [FFIType.ptr, FFIType.ptr, FFIType.f64],
      returns: FFIType.i32,
  },
  vips_sharpen: {
      args: [FFIType.ptr, FFIType.ptr, FFIType.f64],
      returns: FFIType.i32,
  },
  vips_sobel: {
      args: [FFIType.ptr, FFIType.ptr],
      returns: FFIType.i32,
  },
  vips_canny: {
      args: [FFIType.ptr, FFIType.ptr],
      returns: FFIType.i32,
  },
  vips_invert: {
      args: [FFIType.ptr, FFIType.ptr],
      returns: FFIType.i32,
  },
  g_free: {
    args: [FFIType.ptr],
  },
  g_object_unref: {
    args: [FFIType.ptr],
  },
});

export class Image {
  constructor(obj) {
    if (typeof(obj) === 'string') {
      this.img_ptr = symbols.vips_image_new_from_file(Buffer.from(obj, 'utf-8'))
      if (this.img_ptr === null) {
        throw `Unable to open file: ${obj}`
      }
    } else if (obj.constructor === sm.Tensor) {
      if (obj.ndim != 3) {
        throw `Expected tensor of rank 3, was given one of rank ${obj.ndim}`
      }
      // TODO this may need to be saved
      const memory = obj.toUint8Array()
      this.img_ptr = symbols.vips_image_new_from_memory(memory, memory.length, obj.shape[0], obj.shape[1], obj.shape[2], 1)
    } else {
      this.img_ptr = obj
    }
    this.height = symbols.vips_image_get_height(this.img_ptr)
    this.width = symbols.vips_image_get_width(this.img_ptr)
    this.channel = symbols.vips_image_get_bands(this.img_ptr)
  }
  tensor() {
    const size = new BigInt64Array(1);
    const memory = symbols.vips_image_write_to_memory(this.img_ptr, size)
    const buffer = new Uint8Array(toArrayBuffer(memory, 0, Number(size[0])))
    const t = sm.tensor(buffer).reshape([this.width, this.height, this.channel])
    symbols.g_free(ptr(buffer))
    return t
  }
  save(filename) {
    symbols.vips_image_write_to_file(this.img_ptr, Buffer.from(filename, 'utf-8'))
  }
  rotate(deg) {
    const buff = new Float64Array(1)
    symbols.vips_rotate(this.img_ptr, buff, deg)
    return new Image(read.ptr(ptr(buff)))
  }
  resize(scale) {
    const buff = new Float64Array(1)
    symbols.vips_resize(this.img_ptr, buff, scale)
    return new Image(read.ptr(ptr(buff)))
  }
  gaussblur(sigma) {
    const buff = new Float64Array(1)
    symbols.vips_gaussblur(this.img_ptr, buff, sigma)
    return new Image(read.ptr(ptr(buff)))
  }
  sharpen(sigma) {
    const buff = new Float64Array(1)
    symbols.vips_sharpen(this.img_ptr, buff, sigma)
    return new Image(read.ptr(ptr(buff)))
  }
  sobel() {
    const buff = new Float64Array(1)
    symbols.vips_sobel(this.img_ptr, buff)
    return new Image(read.ptr(ptr(buff)))
  }
  canny() {
    const buff = new Float64Array(1)
    symbols.vips_canny(this.img_ptr, buff)
    return new Image(read.ptr(ptr(buff)))
  }
  invert() {
    const buff = new Float64Array(1)
    symbols.vips_invert(this.img_ptr, buff)
    return new Image(read.ptr(ptr(buff)))
  }
}
