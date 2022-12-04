exports.axios = require('axios');
const { generateToken } = require("./generateToken.cjs");
const { getError } = require("./getError.cjs");
const { getUrl } = require("./getUrl.cjs");

exports.addCustomer = async (options) => {
    try {
      const response = await axios({
        method: 'post',
        url: getUrl('AddCustomer'),
        headers: {
          'Content-Type': 'application/json',
        },
        data: { ...options, tokenTypeId: generateToken(options) },
      });

      const error = getError(response.data.ErrorCode);

      return {
        error,
        request: options,
        response: response.data,
      };
    } catch (error) {
      return {
        error,
        request: options,
        response: null,
      };
    }
  };

  