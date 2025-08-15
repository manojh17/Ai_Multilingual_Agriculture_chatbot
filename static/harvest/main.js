import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

// The setupCounter function is preserved as per requirements
document.querySelector('#counter') && setupCounter(document.querySelector('#counter'))