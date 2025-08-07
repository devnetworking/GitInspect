module.exports = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => process.env.DEBUG && console.debug('[DEBUG]', ...args)
};