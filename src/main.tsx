import { render } from 'preact';
import { App } from './App';
import './styles/design-tokens.css';
import './index.css';

render(<App />, document.getElementById('app')!);