---
title: 'Transforming an old portable CRT TV into a smart photo frame'
description: Lorem ipsum
date: 2025-04-02
tags: ["crt", "photoframe", "raspberry", "photo frame", "automation"]
---

Raspberry Pi 4
Raspberry Pi OS Lite 64-bit Bookworm

raspi-config, Display, Enable Composite
sudo nano /boot/firmware/config.txt
    enable_tvout=1

reboot

3.5mm Jack to 3 RCA, pinout: https://www.raspberrypi-spy.co.uk/wp-content/uploads/2014/07/Model-B-Plus-Audio-Video-Jack-Diagram.png

sudo apt update && sudo apt install xserver-xorg xinit feh sox libsox-fmt-mp3

nano ~/.xinitrc

```
#!/bin/sh
unclutter -idle 0 &
xset s off        # Disable screen saver
xset -dpms        # Disable power management
xset s noblank    # Prevent blanking screen
feh --fullscreen --scale-down --auto-zoom --slideshow-delay 5 /path/to/images
```

chmod +x ~/.xinitrc

nano ~/.bash_profile
if [[ -z $DISPLAY ]] && [[ $(tty) == /dev/tty1 ]]; then
  exec startx
fi

sudo mkdir -p /etc/systemd/system/getty@tty1.service.d
sudo nano /etc/systemd/system/getty@tty1.service.d/autologin.conf

```
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin your-username --noclear %I $TERM
```
