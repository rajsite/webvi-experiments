#!/bin/bash

gem install dpl -v 1.10.15
dpl --provider=pages --skip_cleanup --name=rajsite --email=rajsite@users.noreply.github.com --github-token=$GHPAGESTOKEN
