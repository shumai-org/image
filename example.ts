import { Image } from '@shumai/image'

let img = new Image('input.png')
img = img.sharpen(2).resize(2).sobel().invert().rotate(14).gaussblur(3)
let t = img.tensor().div(sm.scalar(2))
t = t.div(sm.scalar(2)).add(sm.scalar(40))
img = new Image(t)
img.save('output.jpg')
