import './URL/Support/URL.js';
import {run} from './WebVIDeno/Support/run/main.ts';

await run(new URL('./index.via.txt', import.meta.url));
