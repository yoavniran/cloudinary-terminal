# Cloudinary Images Terminal


__View Images from cloudinary inside your terminal__

> works best with iTerm because it has support for full def imagess


## How to use

### Install

1. clone this repo
2. run _yarn_ or _npm i_
3. for the ascii images you'll need to install graphicsmagick first - see https://github.com/IonicaBizau/image-to-ascii/blob/master/INSTALLATION.md

### Run


When you run the first time the app will prompt you for your cloud name, api key and secret.
all you can get from your account's dashboad - https://cloudonary.com/console

> Examples below use yarn. you can use the equivalent npm syntax for running scripts

#### Show image by public id

- _yarn start "public_id"_

Or  

- _yarn start -p "public_id"

#### Show image with transformation

_yarn start "sample" "w_200,h_200"_

Or

- _yarn start -p "sample" -t "w_200,h_200"_

[![image](https://raw.githubusercontent.com/yoavniran/cloudinary-terminal/master/sample1.png)](#)

#### Show image with named transformation

- _yarn start -p "sample" -n "my_named_transformation"_

#### Show Images for tag

- _yarn start -# "dogs"_

With transformation: 

- _yarn start -# "dogs" -t "w_200,h_200"_  


#### Ascify your images

> run any of these commands with -a, ex:

- _yarn start -p "sample" -t "w_200,h_200" -a_

[![ascii](http://.png)](#)
 
 
