# JAGAJAG & JOGAJOG

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.4.

## Development server & start

At first Run `npm install` and then Run `npm start` for a dev server. Navigate to `http://localhost:4006/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Demo

Jagajag  => [Jagajag (English Version)](https://www.jagajag.com/#/), 
Jogajog  => [Jogajog (Bangla Version)](https://www.jogajog.com.bd/#/)

## Jagajag Call Flow:

1. Collect `Meeting Info` and `Session id`

2. call `joinMeetingRestApi()`
    => Success: Connect BFCP Socket

3. Connect BFCP Socket
    => Callback response `openConnection()`

    3.1. Process `openConnection() `
        => Call `createConference()`

    3.2. Process `createConference() `
        => If Login user is host user then Call joinConference() ** its Callback 2 response joinConference() & userJoined()
        => else call `addUser()`. ** its only for guest to add him/his on conference.

    3.3. Process `joinConference()`
        => Success: nothing to do.
        => Error: closeConnection();

    3.4. Process `userJoined()`
        => Success: 
            => if, User is Host, then call `createFloor()`;
            => else, User is no Host, then call `requestFloor()`; 
        => Error: 
            => closeConnection();

    3.5. Process `createFloor()`
        => Success: & data.error.code === 400:
            => `updateFloor(50)` for all talker
        => Error:
            => closeConnection();

    3.6. Process `addUser()`
        => success: 
            => call `joinConference()`;
        => Error:
            => closeConnection();

    3.7. Process `updateFloor()`
        => success: 
            => call `requestFloor()`; 
        => Error:
            => closeConnection();

    3.8. Process `requestFloor()`
        => success: 
            => call `OpenVideJoin()`; 
        => Error:
            => closeConnection()

4. openVidu Connect:
    `onConfigRoomJoin() > joinToSession() > connectToSession() `
        
        
## XAMPP Chat and Pubsub

### Pubsub and Xampp Reg with stropee on WebClient
```
1. After Login success
    1. chatRegistration (chatService URL/chat/register)
        1.1 Success: pubsubRegistration (notificationURl/notifications/pubsub/register)
            1.1.1 Success: ConnectXampp by stropee.
                   1.1.1.1 Success: Register Firebase and subscribe firebase for pushNotification
```


## App and Company and Admin User info

### Jagajag.com  (English version)
```
Company id: 78430815-ddfc-415e-9c5c-d10185da8d77
Company name: Jagajag

App id: 34033870-802c-4349-b8a6-d48212d7c507
App name: Jagajag

Admin username: jagajag_admin
Admin user password: jagajag_admin
Admin user id: 12adc317-ba17-49d2-8544-aed85f68d0bc
```

### Jogajog.com.bd  (Bangla version)
```
Company id: 5e146eab-3d84-421b-8748-e0563daf5c24
Company name: Jogajog

App id: 34033870-802c-4349-b8a6-d48212d7c507
App name: Jogajog

Admin username: jogajog_admin
Admin user password: jogajog_admin
Admin user id: b6ed5c07-6135-46f0-b1b8-792365e0a425
```


## electron (desktop) how to prepare build
1. open terminal
2. for  local build, run command :  npm run startdesktop
3. for  production build, run  command :  npm run proddesktop
4. for windows installer, run command : npm run pack-win. for mac and linux plz see package json
5. you will get a folder in root directory named 'release-builds-win'
6. open release-builds-win folder. create 'data' folder inside it. paste all other folders here placed in  release-builds-win .
7. from inno setup software, prepare installer for win. use this script file(see root dir) for setup : Learn2Gether.iss 

## electron (desktop) production build
if there is any heap memory error occured please run the the following command before production build
node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --prod --base-href ./ && electron .

### Note: (Must DO IT For the 1st time Install)
```
1. Please replace 'OpenVidu.js' file from '../node_modules/openvidu-browser/lib/OpenVidu/' directory, which one you find on 'src/savedata/' path on your project.

2. Calender Utils lib path : /node_modules/calendar-utils, which one you find on 'src/savedata/' path on your project.

```