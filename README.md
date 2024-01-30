# Imagemin Guard

(This project has been based on [sum.cumo’s imagemin-merlin](https://github.com/sumcumo/imagemin-merlin). [Changes are documented](https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master), and include this README. Imagemin Guard supports two additional file formats—WebP and AVIF—, comes with improved code and documentation, and is being maintained—including automatically updated dependencies.)

Imagemin Guard takes care of lossless compression of your images, to help you avoid bloat in your repositories. It’s an extension of [imagemin](https://www.npmjs.com/package/imagemin) and a fork of [imagemin-merlin (Merlin)](https://github.com/sumcumo/imagemin-merlin) that makes it convenient and safe to automatically compress JPG, PNG, GIF, WebP, and AVIF images.

It’s convenient because setup is simple. Install, run, add hook, done.

It’s safe because compression happens _losslessly_. Therefore, no worries about forgetting to compress images, but no worries about sacrificing too much quality, either. (You can take care of additional optimizations by yourself or through other tooling.)

## Installation and Use

### 1) Install

Install Imagemin Guard in your project:

```console
npm i -D @j9t/imagemin-guard
```

### 2a) Perform Manual Compression

You can run Imagemin Guard by calling

```console
npx imagemin-guard
```

To make sure that _all_ images are being compressed, it’s recommended to run Imagemin Guard like this at least once, after installation.

(In repositories with large images, you may run into `MaxBufferError`s on `stdout`. You can work around this by using the `--ignore` parameter, as described below, and ignoring the respective file(s); or you could do this step with another tool, if at all, and use Imagemin Guard for automated compression as follows.)

### 2b) Set Up Automatic Compression

For automated use, Imagemin Guard should be triggered through a [Git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) or a related tool like [Husky](https://github.com/typicode/husky) (`npm i -D husky`), for example on `pre-commit`.

For that, using Husky as an example, run the following commands (you can copy and execute them at once):

```console
npm set-script prepare "husky install";\
npm run prepare;\
npx husky add .husky/pre-commit "npx imagemin-guard --staged";\
git add .husky/pre-commit;\
git commit -m "feat: add Husky pre-commit hook for Imagemin Guard"
```

(Note: A couple of years later, this may now be as simple as invoking `npx husky init`. To be tested and updated.)

### Parameters

`--dry` allows to run Imagemin Guard in “dry mode.” All changed files can then be inspected under `/tmp/imagemin-guard`.

`--ignore` allows to specify paths to be ignored (as in `--ignore=example,test`). Multiple paths have to be separated by comma. (Files and paths specified in .gitignore files are generally ignored.)

`--staged` (recommended with automated use) triggers a mode that watches JPG, PNG, GIF, WebP, and AVIF files in `git diff` and only compresses those files—that approach makes Imagemin Guard more efficient in operation.

## How Does the Output Look Like?

Roughly like this (the screenshot shows an early version of Merlin):

![Screenshot of Imagemin Guard’s predecessor, Merlin, in operation.](https://raw.githubusercontent.com/j9t/imagemin-guard/master/media/output.png)

* Green: The image file has been compressed.
* White: The image file has not been changed.
* Blue: The image file had been compressed more than the new result, and was therefore skipped, too.

## How Does Imagemin Guard Work?

Imagemin Guard is a Node script that puts a wrapper around [imagemin-cli](https://www.npmjs.com/package/imagemin-cli) and the packages [imagemin-mozjpeg](https://www.npmjs.com/package/imagemin-mozjpeg), [imagemin-optipng](https://www.npmjs.com/package/imagemin-optipng), [imagemin-gifsicle](https://www.npmjs.com/package/imagemin-gifsicle), [imagemin-webp](https://www.npmjs.com/package/imagemin-webp), and [imagemin-avif](https://www.npmjs.com/package/imagemin-avif).

Automated compression works by monitoring whether a given change list includes any JPGs, PNGs, GIFs, WebPs, or AVIFs. It’s initiated by a Git hook. Only those images are compressed where there is an improvement. The compressed images can then be committed to the underlying repository.

Through this approach, though still glossed over here, Imagemin Guard makes up for what’s missing or complicated in imagemin and related packages, namely easy, riskless, automated, resource-friendly in-repo optimization.

## Why Use Imagemin Guard?

(This is a paraphrased remainder of earlier documentation, left in case it makes anything more clear ☺️)

You _can_ use Imagemin Guard if you need a simple, automatable, robust solution to compress images and to keep the compressed results in your repository (instead of only in the production environment).

That last piece is important, as Imagemin Guard compresses losslessly, so there’s no risk that images suffer from quality issues after processing. With this kind of defensive base compression, there’s no reason, and only advantages, to feed back compressed graphics into the respective source repository.

## What Does Imagemin Guard _Not_ Do?

Imagemin Guard is no substitute for image fine-tuning and micro-optimization. That is difficult to do in an automated fashion, because this type of compression requires [balancing quality and performance](https://meiert.com/en/blog/understanding-image-compression/) and is context-dependent. In its most extreme form, when maximum quality at maximum performance is required from each graphic, micro-optimization is even hard to do manually.

The point is: Micro-optimization still needs to be taken care of through other means, whether manually or through tools (well including other packages from the [imagemin family](https://github.com/imagemin)). Imagemin Guard just solves the problem that images are checked in or go live that are not compressed _at all_.

## What’s Next?

Following [Merlin](https://github.com/sumcumo/imagemin-merlin), which Imagemin Guard is based on, new features may include the option to configure the underlying imagemin plugins (somewhat prepared but not completed yet), or supporting projects in which the project’s .git folder is not at the same level as its package.json (at the moment, automatic mode doesn’t work in these cases).

Also, as some imagemin packages are not maintained at the moment, it may be useful or necessary to change to a different compression solution, like [Sqoosh](https://github.com/GoogleChromeLabs/squoosh). The situation is being monitored. Ideally, any change here will only happen under the hood.

Thoughts or suggestions? Please [file an issue](https://github.com/j9t/imagemin-guard/issues/new) or send a pull request (some code still needs care). Thank you!

## License

Copyright 2019 [sum.cumo GmbH](https://www.sumcumo.com/)

Copyright 2022 [Jens Oliver Meiert](https://meiert.com/en/)

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.