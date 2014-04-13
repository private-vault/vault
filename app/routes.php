<?php

Route::get('/', function()
{
    $existing = Cookie::get('XSRF-TOKEN');
    if (is_null($existing)) {
        $value = md5(Session::token());
        setcookie('XSRF-TOKEN', $value, time()+3600, '/', null, false, 0);
    }
	return View::make('angular');
});

Route::group(['before' => 'ngcsrf'], function() {
    Route::group(['prefix' => 'internal'], function() {
        Route::controller('auth', 'AuthController');
    });

    Route::group(array('prefix' => 'api', 'before' => 'ngauth'), function() {
        Route::get('project/keys/{id}', ['as' => 'keys', 'uses' => 'ProjectController@getKeys']);
        Route::resource('user', 'UserController');
        Route::resource('project', 'ProjectController');
        Route::resource('entry', 'EntryController');
    });
});


