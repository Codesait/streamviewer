# Stream Viewer
for https://gist.github.com/osamakhn/aeed06830fbafa2ff9fd31a8326fec0d

## Application stack:
  ### Front-end:
    React:
      - uses react-router for SPA routing
    Google APIs Client Library for Client-side OAuth2

  ### Back-end:
    Django:
      - RESTful API provided by django-rest-framework
      - Server-side OAuth2 provided by django-rest-framework-social-oauth2

    PostgreSQL Database

  Hosted on AWS, using Elastic Beanstalk and Amazon RDS.

  Justification: I'd never used React and thought this could be a good opportunity to learn to use it for building the SPA. Similar reasoning for hosting on AWS, which was actually a pretty painless experience thankfully.

  Since Node.js wasn't a possibility I figured I should fall back on something I was at least somewhat familiar with for the back-end, but I definitely haven't worked in Django for some time and using it to deliver a SPA hooked up to RESTful API with social auth was like trying to hammer in a nail with a screwdriver. I'd probably try Rails next time and learn Ruby.

  I chose a relational database because it seemed to fit the use case of high-write and low-read data transfer with eventual joins needed for calculating the required statistics.

## Assumptions made:
  - Each stream was meant to have its own stats page instead of a single aggregate one.
  - The only messages saved are ones sent by users of our application, and not all the messages that appear in chat. (Really hoping I didn't misunderstand this and that I was actually supposed to be creating a worker to monitor YouTube live chats and store messages)

## Things left to do:
  - Get an SSL certificate, all client to server communication is currently done over HTTP.
  - Test everything. I cut writing tests to save time and feel awful about it.
  - Query current user channel id on login so that messages received from the current user in chat can be ignored, and then current user messages can be appended immediately locally.
  - Add a dropdown for specifying what category to load streams from
  - Add a visible indicator that there are no more streams to retrieve
  - Add a nice logout button (I made one, but have it disabled in the demo)
  - Add a method for loading more messages in the username search, results are currently paginated with a limit of 50 per page.
  - Properly handle navigating to streams with invalid video_ids (currently just displays an empty YouTube embed and chat)
  - Style historical messages
  - Check overflow on longer historical messages
  - Create app logo and favicon
  - Refactor

## Some design decisions:
  - The server communicates with Google/YouTube API as infrequently as possible, since our client is already authenticated they can make most of the requests to YouTube's API themselves, saving us an RTT. We only communicate with YouTube when the user posts a message to validate that the video_id we receive has a live chat that can be posted to.

  - Stream routes are defined using the YouTube video_id (i.e .../streams/:video_id/) instead of the channelId.
    This is because there is a possibility of multiple live streams per channel, with certain live streams having embedding disabled.
    Using the :video_id as a route parameter allows for a YouTube Live Stream to be embedded immediately on page load without an additional request to determine whether
    the default live stream embed (using https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID) is valid.

    As a result, on the server-side we incur some additional work having to make a request to determine the channel of the video, but we only have to do that the first time we see the video_id.

    Later on I ended up regretting not just doing the request to find a valid
    embeddable stream for the channel and using channel_id for the route, because it means we can't do nice things like have chat users name link directly to their streaming channel (if they have one), and always have a consistent URI for frequently visited channels.

  - The username search uses "contains" (i.e strings can match any subset of the username) for examining usernames, which can get really expensive depending on the size of the dataset, but is nice for searching when you have a guarantee that your dataset size is small. In production I would likely swap this out for a prefix query on username, which can at least take advantage of some indexing.

## Bonus points:
  - I half-attempted to make it responsive, the stats page definitely isn't (it uses some rigid table elements) but the home and stream view are somewhat there.
  - Didn't implement the windowed statistics, I did add a created_at date to the messages column in my schema so this could be accomplished by modifying queries to use that parameter.
  - Didn't implement, could be accomplished by stats queries at regular intervals OR could re-calculate statistics client-side.
