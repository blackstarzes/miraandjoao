# Prerequisites

* NodeJS + npm
* AWS CLI
* Homebrew + imagemagick `brew install imagemagick`

# Setting up

Copy images to the gallery folder (see `src/app/gallery/gallery.json` for structure)

```bash
npm install
gulp galleryOptimisation # O(minutes) Create optimised images for loaders, thumbnails, views
```

# Serving

This does not create optimised images. Make sure to run `gulp galleryOptimisation` first.

```bash
gulp serve
```

# Cleaning

Clean everything:

```bash
gulp cleanAll
```

Clean build (no gallery optimisations):

```bash
gulp cleanBuild
```

Only clean the gallery optimisations:

```bash
gulp cleanGalleryOptimisation
```
