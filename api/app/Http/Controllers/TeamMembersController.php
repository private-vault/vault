<?php namespace App\Http\Controllers;

use App\Vault\Models\History;
use App\Vault\Models\Team;
use App\Vault\Models\UserTeam;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;

class TeamMembersController extends Controller
{
	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
        $validator = Validator::make([
            'user_id' => Input::get('user_id'),
            'id' => Input::get('id')
        ], UserTeam::$rules);

        if ($validator->fails()) {
            return Response::make($validator->messages()->first(), 419);
        }

        $entry = Team::findOrFail(Input::get('id'));
        if (!$entry->can_edit) {
            return Response::json(['flash' => 'Unauthorized.'], 403);
        }

        $model = new UserTeam();
        $model->user_by_id = Auth::user()->id;
        $model->user_id = Input::get('user_id');
        $model->team_id = Input::get('id');
        $model->save();

        History::make('share', 'Added member to team ('.$entry->name.').', $model->id);

        return $model;
	}


	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return UserTeam::where('team_id', $id)->get();
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
        $model = UserTeam::findOrFail($id);

        $entry = Team::findOrFail($model->team_id);
        if (!$entry->can_edit) {
            return Response::json(['flash' => 'Unauthorized.'], 403);
        }

        History::make('entry', 'Deleted team user.', $id);

        $model->delete();
	}
}
