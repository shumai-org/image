import * as sm from "@shumai/shumai";
import { toArrayBuffer } from "bun:ffi";
import { load } from "./load";

const vips = await load();

function stringToNullTerminated(str) {
  const b = new TextEncoder().encode(str);
  const null_term_b = new Uint8Array(str.length + 1);
  null_term_b.set(b);
  return null_term_b;
}

export class Image {
  constructor(obj) {
    if (typeof obj === "string") {
      this.filename = stringToNullTerminated(obj);
      this.img_ptr = vips.from_file(this.filename);
      if (this.img_ptr === null) {
        const error = vips.error();
        vips.clear_error();
        throw `Error in libvips: ${error}`;
      }
    } else if (obj.constructor === sm.Tensor) {
      if (obj.ndim != 3) {
        throw `Expected tensor of rank 3, was given one of rank ${obj.ndim}`;
      }
      // TODO this may need to be saved
      this.memory = obj.toUint8Array();
      this.img_ptr = vips.from_memory(
        this.memory,
        this.memory.length,
        obj.shape[0],
        obj.shape[1],
        obj.shape[2]
      );
    } else if (typeof obj === "number") {
      if (obj == 0) {
        throw `Invalid input, passed ${obj} as image pointer`;
      }
      this.img_ptr = obj;
    } else {
      throw `Invalid input: ${obj}`;
    }
    this.height = vips.get_height(this.img_ptr);
    this.width = vips.get_width(this.img_ptr);
    this.channels = vips.get_bands(this.img_ptr);
  }
  tensor() {
    const size = new BigInt64Array(1);
    const memory = vips.to_memory(this.img_ptr, size);
    const buffer = new Uint8Array(toArrayBuffer(memory, 0, Number(size[0])));
    const t = sm
      .tensor(buffer)
      .reshape([this.width, this.height, this.channels]);
    vips.free_memory(buffer);
    return t;
  }
  save(filename) {
    vips.to_file(this.img_ptr, stringToNullTerminated(filename));
  }
  rotate(deg) {
    return new Image(vips.rotate(this.img_ptr, deg));
  }
  resize(scale) {
    return new Image(vips.resize(this.img_ptr, scale));
  }
  gaussblur(sigma) {
    return new Image(vips.gaussblur(this.img_ptr, sigma));
  }
  sharpen(sigma) {
    return new Image(vips.sharpen(this.img_ptr));
  }
  sobel() {
    return new Image(vips.sobel(this.img_ptr));
  }
  canny() {
    return new Image(vips.canny(this.img_ptr));
  }
  invert() {
    return new Image(vips.invert(this.img_ptr));
  }
  flatten(r, g, b) {
    const ptr = vips.flatten(this.img_ptr, r, g, b);
    if (ptr === null) {
      throw `Cannot flatten image (${this.channels} channels, none are alpha)`
    }
    return new Image(ptr);
  }
}
