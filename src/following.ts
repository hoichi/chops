/**
 * Created by hoichi on 06.02.2017.
 */

/*
 let tplSub = this._tplSubs.byTitle(tplName),
     updates = tplSub.setFollower(page.id, page);

 let tplSub = this._tplSubs.byName(template.id),
     updates = tplSub.setLeader(template);

 * */

import {Dictionary} from "./chops";
export interface FollowingList<L,F> {
    byName(title: string): Following<L,F>
}

interface Following<L,F> {
    setLeader(leader: L): ReadonlyArray<F>;
    setFollower(id: FollowerId, follower: F): ReadonlyArray<F>;
    leader: L | never;
}

type FollowerId = string | number;

const freeze = Object.freeze;

export function FollowingList<L,F>(): FollowingList<L,F> {
    let subs = [];

    function byName(name: string): Following<L,F> {
        let sub = subs[name];

        if (sub === undefined) {
            subs[name] = sub = Following<L,F>();
        }

        return sub;
    }

    return freeze({byName});
}

function Following<L,F>(): Following<L,F> {
    let leader: L,
        followers: Dictionary<F> = Object.create(null);

    function setLeader(newLeader: L) {
        leader = newLeader;

        let results: F[] = [];
        for (let k in followers) {
            results.push(followers[k]);
        }
        return freeze(results);
    }

    function setFollower(id: FollowerId, newFollower: F) {
        followers[id] = newFollower;

        return freeze(  leader === undefined
                        ? []
                        : [newFollower] );
    }

    return freeze({
        setLeader,
        setFollower,
        get leader() {
            if (leader === undefined) throw Error('Trying to access the unset leader. Be patient.');
            return leader;
        }
    });
}