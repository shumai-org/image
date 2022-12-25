import * as sm from '@shumai/shumai'
import { Image } from './image'

for (let i = 0; i < 1000; ++i) {
  let img = new Image('input.png')
  img = img.resize(2).rotate(2).gaussblur(2).sharpen()
  let t = img.tensor()
  t = t.div(sm.scalar(2)).add(sm.scalar(40))
  img = new Image(t)
  img.save('output.jpg')
}
//for (let i = 0; i < 1000; ++i) {
//  let img = new Image('input.png')
//  img = img.sharpen(2).resize(2).sobel().invert().rotate(14).gaussblur(3)
//  let t = img.tensor()
//  t = t.div(sm.scalar(2)).add(sm.scalar(40))
//  img = new Image(t)
//  img.save('output.jpg')
//}

