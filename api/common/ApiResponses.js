const Response = {
    _DefineResponse: function (statusCode = 502, data = {}) {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode,
            body: JSON.stringify(data),
        };
    },
    success: function (data = {}, statusCode = 200) {
        return this._DefineResponse(statusCode, data);
    },

    error: function (data = {}, statusCode = 200) {
        return this._DefineResponse(statusCode, data);
    }
}

module.exports = Response;

