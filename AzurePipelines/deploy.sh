#!/bin/bash

gem install dpl
dpl --provider=pages --skip_cleanup --name=rajsite --email=rajsite@users.noreply.github.com --github-token=$GHPAGESTOKEN
