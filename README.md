### XP Tracker

a Slack App for tracking XP

### Getting Set up

Make sure you have installed
- nodejs
- yarn
- postgres

Also, make sure they are added to your path. If you installed postgres with homebrew you may need something like
```
brew link postgresql@10 --force
```

Run:
```bash
./setup.sh
```

### Run locally
```bash
yarn start
```

# Interacting with the bot
- Add a student score in slack by typing @xp_track and then
the student name, the score and the assignment name.  Example:
@xp_track Matt scored 1234 on Easter egg 123


# TODO
- bot responds when it did something
- anyone can see a score for a person
    @xp_track what is Eric's score?
- students can't add scores or see each other's scores
- updating a score once it's added
- when semester ends, I can review student history
- sum the different assignment scores
- students can see how many points they have
- they can see what work they've gotten credit for / review their own work


-----------

- they get notified when they get points
- update score for a list of students
    @xp_track @Matt @Karin @Tira scored 1234 on Easter egg 123

update student score for Easter Egg 123
they get a notification when they get points
(in slack) review why they didn't get points for something

They can see a progress bar to show they're halfway to their A+
email everyone or announce in Slack with top 5 scores and average score (without names)
teacher can see stats/reporting about who is passing, graphs of scores over time
