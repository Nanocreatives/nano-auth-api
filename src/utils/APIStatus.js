/**
 * Class representing an API Status Response.
 */
class APIStatus {
  /**
   * Creates an API Status.
   * @param {string} message - Response message.
   * @param {string} status - Response status.
   */
  constructor({ message, status = 'success' }) {
    this.status = status;
    this.message = message;
  }
}

module.exports = APIStatus;
