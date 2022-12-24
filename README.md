# Shumai Image

A thin wrapper over libvips integrated with Shumai's native tensor type.
For use with the Bun runtime.

Install:

```
$ brew install libvips
$ bun install @shumai/image
```

Usage:

```javascript
import * as sm from '@shumai/shumai'
import { Image } from '@shumai/image'

// open images from files
let img = new Image('input.png')

// functional API
img = img.sharpen(2)

// allows chaining
img = img.resize(2).sobel().invert().rotate(14).gaussblur(3)

// convert to Shumai tensor
let t = img.tensor().div(sm.scalar(2))

// manipulate image as a tensor and convert back
t = t.div(sm.scalar(2)).add(sm.scalar(40))
img = new Image(t)

// save the output to file
img.save('output.jpg')
```
