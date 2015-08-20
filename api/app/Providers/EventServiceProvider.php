<?php namespace App\Providers;

use App\Vault\Models\Entry;
use App\Vault\Models\EntryTag;
use App\Vault\Models\EntryTeam;
use App\Vault\Models\Project;
use App\Vault\Models\Share;
use App\Vault\Models\Team;
use Illuminate\Contracts\Events\Dispatcher as DispatcherContract;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider {

	/**
	 * The event handler mappings for the application.
	 *
	 * @var array
	 */
	protected $listen = [
		'event.name' => [
			'EventListener',
		],
	];

	/**
	 * Register any other events for your application.
	 *
	 * @param  \Illuminate\Contracts\Events\Dispatcher  $events
	 * @return void
	 */
	public function boot(DispatcherContract $events)
	{
		parent::boot($events);

		Event::subscribe('App\Handlers\Events\AuthHistoryLogger');
		Event::subscribe('App\Handlers\Events\UserHistoryLogger');
		Event::subscribe('App\Handlers\Events\ProjectHistoryLogger');

		Event::subscribe('App\Handlers\Events\ProjectEventHandler');

		Project::observe($this->app->make('App\Events\Observer\ProjectObserver'));
		Entry::observe($this->app->make('App\Events\Observer\EntryObserver'));
		Share::observe($this->app->make('App\Events\Observer\ShareObserver'));
		Team::observe($this->app->make('App\Events\Observer\TeamObserver'));
		EntryTag::observe($this->app->make('App\Events\Observer\EntryTagObserver'));
		EntryTeam::observe($this->app->make('App\Events\Observer\EntryTeamObserver'));
	}

}
