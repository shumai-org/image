#include "vips/vips.h"

VipsImage *from_file(char *filename) {
  return vips_image_new_from_file(filename, NULL);
}

int to_file(VipsImage *image, const char *name) {
  return vips_image_write_to_file(image, name, NULL);
}

VipsImage *from_memory(const void *data, size_t size, int width, int height,
                       int bands) {
  return vips_image_new_from_memory(data, size, width, height, bands,
                                    VIPS_FORMAT_UCHAR);
}
void *to_memory(VipsImage *in, size_t *size) {
  return vips_image_write_to_memory(in, size);
}

void free_memory(void *d) { g_free(d); }

void unref(void* ptr, void* ignore /*ignore*/) {
  g_object_unref((VipsImage*)ptr);
}

typedef void (*JSTypedArrayBytesDeallocator)(void* bytes,
                                             void* deallocatorContext);
JSTypedArrayBytesDeallocator get_unref() {
  return unref;
}

int get_height(VipsImage *img) { return vips_image_get_height(img); }
int get_width(VipsImage *img) { return vips_image_get_width(img); }
int get_bands(VipsImage *img) { return vips_image_get_bands(img); }

VipsImage *rotate(VipsImage *img, double angle) {
  VipsImage *out;
  vips_rotate(img, &out, angle, NULL);
  return out;
}
VipsImage *resize(VipsImage *img, double scale) {
  VipsImage *out;
  vips_resize(img, &out, scale, NULL);
  return out;
}
VipsImage *crop(VipsImage *img, int left, int top, int width, int height) {
  VipsImage *out;
  vips_crop(img, &out, left, top, width, height, NULL);
  return out;
}
VipsImage *gaussblur(VipsImage *img, double sigma) {
  VipsImage *out;
  vips_gaussblur(img, &out, sigma, NULL);
  return out;
}
VipsImage *sharpen(VipsImage *img) {
  VipsImage *out;
  vips_sharpen(img, &out, NULL);
  return out;
}
VipsImage *sobel(VipsImage *img) {
  VipsImage *out;
  vips_sobel(img, &out, NULL);
  return out;
}
VipsImage *canny(VipsImage *img) {
  VipsImage *out;
  vips_canny(img, &out, NULL);
  return out;
}
VipsImage *invert(VipsImage *img) {
  VipsImage *out;
  vips_invert(img, &out, NULL);
  return out;
}
VipsImage *flatten(VipsImage *img, double r, double g, double b) {
  VipsImage *out;
  double array[] = { r, g, b };
  VipsArrayDouble *vips_array = vips_array_double_newv(3, r, g, b);
  vips_flatten(img, &out, "background", vips_array, NULL);
  vips_area_unref(VIPS_AREA(vips_array));
  return out;
}

const char *error() {
  return vips_error_buffer();
}

void clear_error() {
  vips_error_clear();
}
