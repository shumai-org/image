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
