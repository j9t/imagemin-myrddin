# Imagemin Guard

(This project is based on [sum.cumo’s imagemin-merlin](https://github.com/sumcumo/imagemin-merlin). Imagemin Guard supports two additional file formats—WebP and AVIF—, is maintained and therefore based on up-to-date dependencies, and comes with improved code and documentation. The project is still in the process of being released—expect further updates.)

Imagemin Guard takes care of lossless compression of your images, to help you avoid bloat in your repositories. It’s an extension of [imagemin](https://www.npmjs.com/package/imagemin) and a fork of [imagemin-merlin](https://github.com/sumcumo/imagemin-merlin) that makes it super-easy to automatically, efficiently compress JPG, PNG, GIF, WebP, and AVIF images.

It’s super-easy for two reasons:

1. Setup is simple. Install, run, done.

2. Compression happens _losslessly_ through standard settings. No worries about forgetting to compress images; no worries about sacrificing quality, either.

## Installation and Use

### 1) Install

Install Imagemin Guard in your project:

```bash
@@ npm i -D imagemin-guard
```

### 2a) Perform Manual Optimization

For manual use, add the following in the `scripts` section of your project’s package.json:

```json
{
  "scripts":{
    "imagemin": "imagemin-guard"
  }
}
```

To ensure that _all_ JPGs, PNGs, GIFs, WebPs, and AVIFs are optimized, it’s recommended to run Imagemin Guard manually right after installation: `npm run imagemin`.

There’s a `--folder` option that allows to set a particular folder for compression, different from the project root. For example, `npm run imagemin -- --folder=test`. `node_modules` is ignored by default.

`--dry` allows to run Imagemin Guard in “dry mode.” All changed files can then be inspected under `/tmp/imagemin-guard`.

`--ignore` lets Imagemin Guard ignore the specified paths. Multiple paths have to be seperated by comma.

### 2b) Set Up Automatic Optimization

For automated use Imagemin Guard should be triggered through a [Git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) or a related tool like [Husky](https://github.com/typicode/husky) (`npm i -D husky`), for example on `pre-commit`. For that, using Husky as an example, the following may be added to package.json (main level):

```json
"husky": {
  "hooks": {
    "pre-commit": "npm run imagemin -- --staged"
  }
},
```

The `--staged` parameter triggers a mode that watches JPG, PNG, GIF, WebP, and AVIF files in `git diff` and only compresses those files—that approach makes Imagemin Guard be quite efficient in operation. (The `folder` parameter doesn’t work in `staged` mode.)

## How Does the Output Look Like?

![Screenshot of Imagemin Guard’s predecessor, Merlin, in operation.](docs/media/output.png)

* Green: The image file has been optimized.
* White: The image file has not been changed.
* Blue: The image file had been compressed more than the new result, and was therefore skipped.

## How Does Imagemin Guard Work?

Imagemin Guard is a Node script that puts a little [wrapper](bin/imagemin-guard.js) around [imagemin-cli](https://www.npmjs.com/package/imagemin-cli) and the packages [imagemin-mozjpeg](https://www.npmjs.com/package/imagemin-mozjpeg), [imagemin-optipng](https://www.npmjs.com/package/imagemin-optipng), [imagemin-gifsicle](https://www.npmjs.com/package/imagemin-gifsicle), [imagemin-webp](https://www.npmjs.com/package/imagemin-webp), and [imagemin-avif](https://www.npmjs.com/package/imagemin-avif).

Unless manual optimization over the project or subfolders is triggered, automated compression works through Git hooks that monitor whether a given change list includes image files. If it does, only those images are compressed where there is an improvement, so as to prevent regressions and to be able to actually feed back the improved images to the underlying repository.

Through this approach, though still glossed over here, Imagemin Guard makes up for what’s missing or complicated in imagemin and related packages, namely easy, riskless, automated, resource-friendly “on site” optimization.

### Why Use Imagemin Guard?

(This is just a paraphrased remainder of earlier documentation, left in case it makes anything more clear ☺️)

You _can_ use Imagemin Guard if you need a simple, automatable, robust solution to compress images and to keep the compressed result in your repository (instead of only in the production environment).

That last piece is useful since Imagemin Guard compresses losslessly, so that there’s no risk that images suffer from quality issues after processing. This kind of defensive base compression makes it obvious to also want to feed back compressed graphics into one’s source repository—which is why Imagemin Guard works the way it does

## What Does Imagemin Guard _Not_ Do?

Imagemin Guard is no substitute for image fine-tuning and micro-optimization. That is difficult to do in an automated fashion, because that type of compression requires balancing quality and performance, which is [context-dependent](https://meiert.com/en/blog/understanding-image-compression/). In its most extreme form, when maximum quality at maximum performance is required from each graphic, micro-optimization is even hard to do manually.

The point is: Micro-optimization still needs to be taken care of through other means, whether manually or through tools (well including other packages from the [imagemin family](https://github.com/imagemin)). Imagemin Guard simply solves the problem that images are checked in or go live that are not compressed _at all_.

## What’s Next?

Similar to [Merlin](https://github.com/sumcumo/imagemin-merlin), which Imagemin Guard is based on, new features may include:

* the option to configure the underlying imagemin plugins (somewhat prepared for but not completed yet);
* observing .gitignore files when Imagemin Guard doesn’t run as `--staged`;
* supporting projects in which the project’s .git folder is not at the same level as its package.json—at the moment, automatic mode doesn’t work in these cases.

Thoughts, suggestions, fixes? Please file an [issue](https://github.com/j9t/imagemin-guard/issues/new) or send a pull request—thank you!

## License

Copyright 2019 [sum.cumo GmbH](https://www.sumcumo.com/)

Copyright 2022 [Jens Oliver Meiert](https://meiert.com/en/)

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.