# UI

No new UI or layout. Existing request/response payloads, JWT, private audio, FSRS reveal/rating and error states remain. GET vocabulary serverNow remains PostgreSQL-authoritative. Regression uses current browser/native API suites.

Redis down: existing generic error presentation shows503/QUEUE_UNAVAILABLE message and retains learner input. No layout/component changes. Readiness JSON adds queueAvailable and degraded status; this endpoint is operational, not a learner screen. Login/profile/draft CAS/save continue through PostgreSQL.
