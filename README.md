# Imagemin Guard

(This project was based on [sum.cumo’s imagemin-merlin](https://github.com/sumcumo/imagemin-merlin). [Changes are documented](https://github.com/sumcumo/imagemin-merlin/compare/master...j9t:master), and include this README. Imagemin Guard supports two additional file formats—WebP and AVIF—, comes with improved code and documentation, and is being maintained. For this reason, it’s not based on any imagemin packages anymore.)

Imagemin Guard takes care of near-lossless compression of your images, to help you avoid bloat in your repositories. It makes it convenient and as safe as possible to automatically compress JPG, PNG, GIF, WebP, and AVIF images.

It’s convenient because setup is simple. Install, run, add hook, done.

It’s as safe as possible because compression happens losslessly (to be precise, near-lossless for PNG and GIF images). That allows you to stop worrying about forgetting to compress images, but also about sacrificing too much quality. (You can take care of additional optimizations by yourself or through other tooling.)

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

For that, using Husky as an example, run the following commands in your project root (you can copy and execute them at once):

```console
npx husky init;\
echo "npx imagemin-guard --staged" > .husky/pre-commit;\
git add .husky/pre-commit;\
git commit -m "feat: add Husky pre-commit hook for Imagemin Guard"
```

### Parameters

* `--dry` allows you to run Imagemin Guard in “dry mode.” All changes are shown in the terminal.

* `--ignore` allows you to specify paths to be ignored (as in `--ignore=example,test`). Multiple paths must be separated by commas. (Files and paths specified in .gitignore files are generally ignored.)

* `--staged` (recommended with automated use) triggers a mode that watches JPG, PNG, GIF, WebP, and AVIF files in `git diff` and only compresses those files—that approach makes Imagemin Guard more efficient in operation.

## What Does the Output Look Like?

Roughly like this (the screenshot is still based on an early version of Merlin):

![Screenshot of Imagemin Guard’s predecessor, Merlin, in operation.](https://raw.githubusercontent.com/j9t/imagemin-guard/master/media/output.png)

* Green: The image file has been compressed.
* White: The image file has not been changed.
* Blue: The image file had been compressed more than the new result, and was therefore skipped, too.

## How Does Imagemin Guard Work?

Imagemin Guard is a Node script currently using [sharp](https://www.npmjs.com/package/sharp) and [gifsicle](https://www.npmjs.com/package/gifsicle) under the hood.

Automated compression works by monitoring whether a given [change list](https://webglossary.info/terms/change-list/) includes any JPGs, PNGs, GIFs, WebPs, or AVIFs. It’s initiated by a Git hook. Only those images are compressed where there is an improvement. The compressed images can then be committed to the underlying repository.

Through this approach, though still glossed over here, Imagemin Guard makes up for what’s missing or complicated in other packages, namely easy, near-riskless, automatable, resource-friendly in-repo optimization.

## Why Use Imagemin Guard?

(This is a paraphrased remainder of earlier documentation, left in case it makes anything more clear ☺️)

You _can_ use Imagemin Guard if you need a simple, automatable, robust solution to compress images and to keep the compressed results in your repository (instead of only in the production environment).

That last piece is important, as Imagemin Guard compresses near-losslessly, so there’s little risk that images suffer from quality issues after processing. With this kind of defensive base compression, there’s no reason, and only advantages, to feed back compressed graphics into the respective source repository.

## What Does Imagemin Guard _Not_ Do?

Imagemin Guard is no substitute for image fine-tuning and micro-optimization. That’s difficult to do in an automated fashion, because this type of compression requires [balancing quality and performance](https://meiert.com/en/blog/understanding-image-compression/) and is context-dependent. In its most extreme form, when maximum quality at maximum performance is required from each graphic, micro-optimization is even hard to do manually.

The point is: Micro-optimization still needs to be taken care of through other means, whether manually or through tools (well including other packages from the [imagemin family](https://github.com/imagemin)). Imagemin Guard just solves the problem that images are checked in or go live that are not compressed _at all_.

## What’s Next?

There are a few ideas, like adding light SVG support, or ensuring compatibility with projects in which the project’s .git folder is not at the same level as its package.json (currently, automatic mode doesn’t work in these cases).

Feedback is appreciated: Please [file an issue](https://github.com/j9t/imagemin-guard/issues/new) or send a pull request. Thank you!

## License

Copyright 2019 [sum.cumo GmbH](https://web.archive.org/web/20191208211414/https://www.sumcumo.com/)

Copyright 2022 [Jens Oliver Meiert](https://meiert.com/en/)

Licensed under the Apache License, Version 2.0 (the “License”); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.