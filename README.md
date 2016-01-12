# angular-simple-cache
AngularJS simple cache factory for caching API calls.

## Introduction
First, let me explain what this module is for, just in case you are unclear :)
Many sites today use API calls to gather their data, when using AngularJS there is a caching property on the $http call which allows you to specify a cache factory. For some reason the default one just doesn't do anything but cache your results and this is why I created this module.

Not only does it cache any api calls, when a put / post or delete is called on the same endpoint, it removes any related cached results so that the next call is fresh (which is then cached).

This means that if you are using an API that has the same endpoint for all CRUD actions, then it is handled easily without any interaction from you.

For example, if you were to try to get all products from an API, you might do something like this:

```
GET /products
```

and you would get a list of all your products, but if you want to get a single product, the request might look like this:

```
GET /products/123
```

So, both these results would be cached for future use.
If you were to create a new product, update or delete an existing product the module simple removes anything that uses the same url in this case that would mean that both products and products/123 would be removed from the cache and the next call would make an actual call to the API and cache the results again.

## Installation

Like any other bower package, you can install this by using the command below:

```
$ bower install angular-simple-cache
```

## Usage

The module itself is really easy to use and can be used with no configuration.
All you have to do is add the service to the cache property of all the $http requests that you wish to cache.
For illustation purposes, here is a wrapper for the $http method:

```
.service('ApiHandler', ['$q', '$http', 'SimpleCache', 'apiUrl', function ($q, $http, simpleCache, apiUrl) {

    // Private function to build our request
    var buildRequest = function (url, method, data, params) {

        // Create our deferred promise
        var deferred = $q.defer();

        // Create the model
        var model = {
            method: method,
            url: apiUrl + url,
            data: data,
            params: params,
            cache: simpleCache
        };

        // If we are performing an update/create or delete call
        if (method !== 'GET') {

            console.log('clearing cache');

            // Remove from our cache
            simpleCache.remove(apiUrl + url);
        }

        // Build our request
        $http(model).then(function (response) {

            // Resolve our response
            deferred.resolve(response.data || response);

        // If we have an error
        }, function (error) {

            // Reject our promise
            deferred.reject(error);
        });

        // Return our promise
        return deferred.promise;
    };

    // GET
    this.get = function (url, params) {
        return buildRequest(url, 'GET', null, params);
    };

    // POST
    this.post = function (url, data) {
        return buildRequest(url, 'POST', data);
    };

    // PUT
    this.put = function (url, data) {
        return buildRequest(url, 'PUT', data);
    };

    // DELETE
    this.delete = function (url, params) {
        return buildRequest(url, 'DELETE', null, params);
    };
}])
```

In this example apiUrl is just a constant:

```
.constant('apiUrl', 'http://localhost/')
```

### Options

There are 2 constants that ship with this module:

* **simpleCacheTimeOut** in seconds, the default is 1 hour.
* **simpleCacheDebugging** if set to true, you will see messages in the console log. The default is set to false.

You can set these as you would any other constant:

```
.constant('simpleCacheDebugging', true)
```

## License

Mit License: [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)
