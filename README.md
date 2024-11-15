## Obtain the AppID and the Temporary Token

Follow instructions in [Before Using RTC Service](https://docs.byteplus.com/byteplus-rtc/docs/69865) to get the AppID and generate a temporary Token. You need to enter the room ID and the user ID when generating the token, and they must be consistent with the room ID and the user ID that you enter on the login page of the Demo.

## Configure the Demo Project File

1. Install Node.js and yarn globally.
2. Fill in the appId ,roomId and token in src/config.ts with the AppID and the temporary token you get from the console.

```
const config = {
  appId: 'yourAppId',
  roomId: 'yourRoomId',
  tokens: [
    {
      userId: 'yourUserId1',
      token: 'yourToken1',
    },
    {
      userId: 'yourUserId2',
      token: 'yourToken2',
    }
  ],
};
```

## Compile and Run the Demo

1. Run the following command to install dependencies.

```

yarn

```

2. Run the following command to start the Demo.

```

yarn start

```

```

```
