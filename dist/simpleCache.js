(function() {
  'use strict';

  // Create our module
  angular.module('ngSimpleCache', []).factory('SimpleCache', simpleCache);

  // Inject dependancies
  simpleCache.$inject = ['$cacheFactory', 'simpleCacheTimeout', 'simpleCacheDebugging'];

  // Create our function 
  function simpleCache($cacheFactory, timeout, debugging) {

    // Create a variable for our timers
    var timers = [],
        cache = $cacheFactory('Cache');

  	// Create our object
  	var simpleCache = {
  		get: get,
  		put: put,
  		remove: remove
  	}

  	// Return our service
  	return simpleCache;

    // Used to get the cache for a particular url
    function get(key) {

        // If we have not timed out
        if (!_hasTimedOut(key)) {

            _debugMessage('Retrieving from cache ' + key);

            // Return our cache
            return cache.get(key);
        }
    };

    // Used to set the cache for a url
    function put(key, value) {

        // Get our timer index
        var index = _hasKey(key);

        // If this is the first time we are setting the cache
        if (index === -1) {

            _debugMessage('getting fomr cache: ' + key);

            // Create a new time
            var time = new Date().getTime();

            // Create a new timer
            var timer = {
                url: key,
                time: time
            };

            // Add our timer to our array
            timers.push(timer);

            _debugMessage('Adding to cache: ' + key);

            // Cache our response
            cache.put(key, value);
        }
    };

    // Removes all asociated items from the array
    function remove(key) {

        // Get our pairs
        var pairs = key.indexOf('/') > -1 ? key.split('/') : [key],
            base = pairs[0];

        // Loop through our timers
        for (var i = timers.length - 1; i >= 0; i--) {

            // Get the current timer
            var timer = timers[i];

            // Get the index
            var index = timer.url.indexOf(key);

            // if we find the partial match
            if (index > -1) {

                // Remove the timer
                timers.splice(i, 1);

            	_debugMessage('Removing from cache: ' + key);
            }
        }
    };

    // Finds the url matching the key supplied
    function _hasKey(key) {

        // If we have any timers currently active
        if (timers.length) {

            // Loop through our timers
            for (var i = 0; i < timers.length; i++) {

                // Get the current timer
                var timer = timers[i];

                // If the timer has the exact key
                if (timer.url === key) {

                    // Return the index
                    return i;
                }
            }
        }

        // Return false
        return -1;
    };

    // Checks to see if the cache has timed out, if it has it removes the timer from the array
    function _hasTimedOut(key) {

        // Get our timer index
        var index = _hasKey(key);

        // If our timer does not exist, we have timed out
        if (index === -1)
            return true;

        // If our timer exists
        if (index > -1) {

            // Get the current time
            var time = timers[index].time,
                current = new Date().getTime(),
                elapsed = (current - time) / 1000;

            // If it has been more than the timeout since our last request
            if (elapsed > timeout) {

                // Remove our timer
                timers.splice(index, 1);

                // Return true
                return true;
            }
        }

        // Return false
        return false;
    };

    // Writes a message to the console
    function _debugMessage(message) {

    	// If the console is not available, exit the function
		if (!window.console)
			return;

		// If we are debugging
		if (debugging) {

			// Write our message to the console
			console.log(message);
		}
    };
  };
}());

(function() {
  'use strict';

  angular.module('ngSimpleCache')
    .constant('simpleCacheTimeout', 3600)
    .constant('simpleCacheDebugging', false);
}());