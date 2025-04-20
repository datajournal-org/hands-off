# "Hands Off!" protests

This repo builds the map at https://datajournal.org/hands-off/

## Improve

To add more images, edit the file [data/2025-04-19.yaml](https://github.com/datajournal-org/hands-off/blob/main/data/2025-04-19.yaml).

-  Each entry is for a single city. If there are multiple protests in a city, we'll only focus on the main protest event.
-  Add the URL of the post/article about the protest in that city, and copy & paste URLs of good pictures from this post/article.
-  Only protests "against Trump", "Hands Off", "50501", etc. from April 19, 2025.
-  Only posts/articles without a paywall.
-  Only good photos that show crowds.
-  Each city should have more than three pictures, but the maximum is ten per city. The map itself can have no more than seven markers per city.

Example:

```yaml
  sources:
    - url: https://media1.com/article.php
      photos:
        - https://cdn.media1.com/photos/1.webp
        - https://cdn.media1.com/photos/2.webp
        - https://cdn.media1.com/photos/3.webp
    - url: https://media2.com/article.php
      photos:
        - https://static.media2.com/photos/1.jpeg
        - https://static.media2.com/photos/2.jpeg
        - https://static.media2.com/photos/3.jpeg
```
