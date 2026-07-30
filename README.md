# Pure JavaScript Page Blocker & Spinner

A lightweight page/element blocker and spinner for use during AJAX calls, file reads, or any async operation — prevents unwanted user interaction while work is in progress.

## Installation

1. Import `bootstrap.min.css`
2. Import `bootstrap.bundle.min.js`
3. Import `blockerscb.js`

## Usage

### Block & unblock by ID
```js
blockerscb.block("#FormLoginTest");
blockerscb.unblock("#FormLoginTest");
```

### Block & unblock by class
```js
blockerscb.block(".text-danger");
blockerscb.unblock(".text-danger");
```

### Block & unblock the whole page
```js
blockerscb.block();
blockerscb.unblock();
```

## Supported Input Types

| Input Type | Example |
|---|---|
| CSS selector | `blockerscb.block('#saveButton')` |
| DOM element | `blockerscb.block(document.getElementById('panel'))` |
| NodeList | `blockerscb.block(document.querySelectorAll('.card'))` |
| Array of elements | `blockerscb.block([el1, el2])` |
| Config object | `blockerscb.block({ target: panel })` |
| jQuery object | `blockerscb.block($('#detailsPanel'))` |
| Full page | `blockerscb.block()` |

## API Reference

### `blockerscb.block(target?)`
Blocks the specified target. Omit `target` to block the entire page.

### `blockerscb.unblock(target?)`
Unblocks the specified target. Omit `target` to unblock the entire page.

### `blockerscb.isBlocked(target)`
Returns `true` if the target is currently blocked.

```js
if (blockerscb.isBlocked(panel)) {
    console.log('Panel is currently blocked.');
}
```