var sharemyplaylists = {
	
	public_key: '',
	private_key: '',

	api_base: 'http://sharemyplaylists.com/api/',
	api_version: '2',
	api_auth: 'signed_sha256',

	
	setup: function( public_key, private_key )
	{
		if( typeof CryptoJS === 'undefined' || typeof CryptoJS.SHA256 === 'undefined' )
		{
			throw new Error("CryptoJS.SHA256 is required to use the API.");
		}

		this.private_key = private_key;
		this.public_key = public_key;
	},

	api: function( method, parameters, callback )
	{
		var parameters = parameters || {};
		var callback = callback || function(){};

		var timestamp = Math.round(new Date().getTime() / 1000);
		var url = this.api_base+'v'+this.api_version+'?method=smp.'+method;

		var signature = this.public_key.toString()+this.private_key.toString()+timestamp.toString();
		var signature = CryptoJS.SHA256(signature);
		var signature = signature.toString();

		parameters.public_key = this.public_key;
		parameters.timestamp = timestamp;
		parameters.signature = signature;

		if( url_parameters = this.buildQuery(parameters) )
		{
			url+= '&'+url_parameters;
		}

		this.request( url, callback );

		return this;
	},
	
	buildQuery: function( formdata, numeric_prefix, arg_separator )
	{
		var value, key, tmp = [],
		that = this;
		
		var _http_build_query_helper = function (key, val, arg_separator)
		{
			var k, tmp = [];
			if (val === true)
			{
				val = "1";
			}
			else if (val === false)
			{
				val = "0";
			}

			if (val != null)
			{
				if(typeof(val) === "object")
				{
					for (k in val)
					{
						if (val[k] != null)
						{
							tmp.push(_http_build_query_helper(key + "[" + k + "]", val[k], arg_separator));
						}
					}
					
					return tmp.join(arg_separator);
				}
				else if (typeof(val) !== "function")
				{
					return encodeURIComponent(key) + "=" + encodeURIComponent(val);
				}
				else
				{
					throw new Error('There was an error processing your object.');
				}
			}
			else
			{
				return '';
			}
		};

		if (!arg_separator)
		{
			arg_separator = "&";
		}

		for (key in formdata)
		{
			value = formdata[key];
			if (numeric_prefix && !isNaN(key))
			{
				key = String(numeric_prefix) + key;
			}
			
			var query=_http_build_query_helper(key, value, arg_separator);
			
			if(query != '')
			{
				tmp.push(query);
			}
		}
		
		return tmp.join(arg_separator);
	},
	
	request: function( url, callback, post_data )
	{
		var XMLHttpFactories = [
			function () {return new XMLHttpRequest()},
			function () {return new ActiveXObject("Msxml2.XMLHTTP")},
			function () {return new ActiveXObject("Msxml3.XMLHTTP")},
			function () {return new ActiveXObject("Microsoft.XMLHTTP")}
		];

		var req = false;
		for ( var i = 0; i < XMLHttpFactories.length; i++ )
		{
			try {
				req = XMLHttpFactories[i]();
			}
			catch (e) {
				continue;
			}
			break;
		}

		if ( !req ) return;

		var method = post_data ? "POST" : "GET";

		req.open( method, url, true );

		if (post_data)
		{
			req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		}

		req.onreadystatechange = function ()
		{
			if (req.readyState != 4) return;
			if (req.status != 200 && req.status != 304) {
				return;
			}

			var data = JSON.parse(req.responseText);
			callback(data);
		}

		if (req.readyState == 4) return;

		req.send(post_data);
	}
	
};