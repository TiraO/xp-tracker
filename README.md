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



# TODO
- update a student score
    @score-bot add @Matt 1234 "Easter egg 123"
- when semester ends, I can review student history
- sum the different assignment scores
- see how many points they have
- they can see what work they've gotten credit for / review their own work


-----------

- they get notified when they get points
- update score for a list of students
    /update-score @Matt @Karin @Tira 1234 "Easter egg 123"

update student score for Easter Egg 123
they get a notification when they get points
(in slack) review why they didn't get points for something

They can see a progress bar to show they're halfway to their A+
email everyone or announce in Slack with top 5 scores and average score (without names)
