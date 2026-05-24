# Styles Directory (`/frontend/src/styles`)

This directory contains shared CSS constants and utility structures used across React components.

## Files

- **`common.js`**: Exports a series of template literal strings containing TailwindCSS classes. This ensures a consistent design system (buttons, inputs, cards, headings) across the entire application without needing to redefine complex class strings in every component.

## Usage
Import the classes into your components and apply them to `className`:
```javascript
import { primaryBtn, inputClass } from '../styles/common';

<button className={primaryBtn}>Submit</button>
<input className={inputClass} />
```
