# Browser Issues of xssinterface #

The new [Google Gears](http://gears.google.com/) backend should work in all Browsers that have Google Gears installed.

| **Browser**   | **OS** | **State** |
|:--------------|:-------|:----------|
| Firefox 1.5 | WinXP | verified |
| Firefox 2 | OSX 10.4| verified |
| Firefox 2 | WinXP | verified |
| Firefox 3 | WinXP | verified (Uses postMessage) |
| Opera 9   | WinXP | verified |
| Safari    | All | verified, but limited. iFrames (widgets) may call their container, but the container cannot call the iframe  |
| Safari    | Latest nightlies | Should work (Uses postMessage fallback)  |
| IE 6      | WinXP | verified |
| IE 7      | All | Basically works, but one needs to either place a [P3P Privacy Policy](http://www.w3.org/TR/P3P/) one the sites or the user needs to allow setting of third-party cookies from the participating domains |

Feel free to add your results here.

# Test #

To test xssinterface under different controlled circumstances, visit the [automated testing page](AutomatedTests.md).