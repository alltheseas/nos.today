/* eslint-disable @next/next/no-img-element */
"use client";

import { useApp } from "@/lib/App";
import { Event, GenericProfile, Profile } from "nostr-mux";
import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";
import {
  differenceInMinutes,
  differenceInSeconds,
  format,
  isSameDay,
} from "date-fns";
import { SnippableContent } from "./SnippableContent";
import { encodeBech32ID } from "nostr-mux/dist/core/utils";
import Link from "next/link";
import { Nip36Protection } from "./Nip36Protection";

type Props = {
  note: Event;
};

function formatDatetime(date: Date, currentTime: Date) {
  const sec = differenceInSeconds(currentTime, date);

  if (sec < 60) {
    return "<1m";
  } else if (sec < 60 * 60) {
    return differenceInMinutes(currentTime, date) + "m";
  } else if (isSameDay(currentTime, date)) {
    return format(date, "HH:mm");
  } else {
    return format(date, "yyyy-MM-dd");
  }
}

export const Note = ({ note }: Props) => {
  const app = useApp();
  const [profile, setProfile] = useState<Profile<GenericProfile>>();

  useEffect(() => {
    app.aps.get(note.pubkey).then((profile) => profile && setProfile(profile));
  }, [app.aps, note.pubkey]);

  const date = new Date(note.created_at * 1000);
  const pubkeyUri = "nostr:" + encodeBech32ID("npub", note.pubkey);
  const noteUri = "nostr:" + encodeBech32ID("note", note.id);

  return (
    <div key={note.id} className="card card-bordered shadow-lg my-3">
      <div className="card-body break-all p-5">
        <div className="flex gap-3">
          <Avatar pubkeyUri={pubkeyUri} profile={profile} />
          <div className="flex flex-col w-full gap-2">
            <div className="flex flex-row">
              <div className="flex-1 text-sm">
                <Link href={pubkeyUri}>
                  {!profile && (
                    <div className="my-2 h-2 w-32 bg-slate-200 rounded animate-pulse"></div>
                  )}
                  <strong>{profile?.properties.displayName}</strong>{" "}
                  {profile?.properties.name && "@" + profile?.properties.name}
                </Link>
              </div>
              <div className="flex-none text-sm">
                <Link href={noteUri}>
                  <span title={date.toISOString()} className="text-primary">
                    {formatDatetime(date, app.currentTime)}
                  </span>
                </Link>
              </div>
            </div>
            <Nip36Protection note={note}>
              <SnippableContent note={note} />
            </Nip36Protection>
          </div>
        </div>
      </div>
    </div>
  );
};
