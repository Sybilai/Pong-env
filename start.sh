forever stopall
sleep 1
forever start dataCenter.js
sleep 1
forever start -c "node --expose-gc" environment.js
sleep 1
forever start visualizer.js
