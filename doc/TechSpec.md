## IN

## Collections

A chainable `.collect()` (or something like `collectPrimary()`) passes down a page with (`prev`/`next`) set.

## Data

### Data Flow

<chokidar (or its wrapper)>
    ↓           (chokidar _new_/_changed_; **path**)
<file reader>
    ↓           (**meta** (+path), **raw content**, **url**)
<markup converter>
    ↓           (**meta**, **html content**)
<url builder (default or configurable)>                 
        // Yes, it should be _set up_ chainably, but can be actually _executed_ at the same level as markup converter, whenever we have enough data available
    ↓           (**meta**, **html content**, **url**)
<combiners (maybe)>
    ↓           (**a page build of a few more**)
<collector> →   <collection>
    ↓           (**meta**, **html content**, **url**, **prev/next**)
<renderer>  ←   <template compiler>
    ↓           (**a built page**, **meta**, **url**)
<file writer>

### Data chains

Every...basically every file sent down the chains can be...
    - .put()
    - .patch()’ed
    - .delete()’d

Although... how we do delete? Do we index by source paths? Seems like it, but what if we don’t use `.src()`? Maybe that means that src() should kindly state the primary index.
