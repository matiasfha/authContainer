import chai from 'chai'
import jsdom from 'jsdom'

global.expect = chai.expect
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = global.window.navigator
