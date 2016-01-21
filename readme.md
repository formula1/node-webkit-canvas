# What is this?

```
example.html |> webkit.js(Canvas(headless-gl)) |>  Buffer
```

The goal is to transform html documents into Buffers. This example is using pre-existing technologies (webkit.js, headless-gl and node-canvas) to reach this goal.

# Issues
Currently it doesn't "break" but it doesn't render anything. I believe the issue is that headless-gl has not implemented certian methods. Out of the 144 methods necessary to drive webkit.js, 14 are unimplemented

# What can be done more
- Cleanout Webkit.js
  - GetUserMedia, Websocket, etc - delete this crap
- Allow Webkit to accept more arguments
  - Window Object
  - XMLHTTPRequest
  - Generating Canvas'
  - Document Object (which is only used for generating canvas' and going fullscreen);
  - URL resolver
- Canvas interfaces with JSDom
  - DOM on the server is a pretty fresh technology, however JSDOM is currently the standard
  - As it is I created a DOM replacement just to handle the bare minimums that webkit.js requires
    - Perhaps this is a better goal to seek to full compliance
- Implement window as an Abstract Class
  - This may allow us to set viewport height/width and scroll x/y
- Canvas getContext returns either a headless-gl or node-canvas
  - This is a little more difficult since the canvas from node-canvas is a c++ Object rather than a JS wrapper
- Make the system more isomorphic
  - I currently have to go through hoops to make sure this is working properly
- Rip out important technologies to use elsewhere
  - This will likely never happen
