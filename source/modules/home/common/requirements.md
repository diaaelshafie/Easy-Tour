# API docs

## allow notifications API [done , test it]

### inputs (request)

- pushToken : String -> either new or refreshed
- token : String
- action : 'enable' , 'disable' , 'refresh'
- oldPushToken : String (##)

### output (response)

- status : 204 (no-content) -> success / 500 : internal server -> fail / 400 : bad request ->
- 500 : internal server

## (tourist) sendRequest API

### notification sending [done , test it]

- fetch tourGuide pushToken -> token in firebaseAdmin
- notification: {body:"${TouristName} wants to request a trip" , title:TouristName}
- send the notification

## (tourGuide) handle request

### acceptance notification [done , test it]

- fetchPushToken (tourist) -> token in firebaseAdmin
- notification: {body:"${tourGuideName} accepted your request",title:"request accepted!"}

### rejection notification [done , test it]

- fetchPushToken (tourist) -> token in firebaseAdmin
- notification: {body:"${tourGuideName} rejected your request",title:"request rejected!"}
