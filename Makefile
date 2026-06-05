kill-port:
	@-kill $$(lsof -ti:5000) 2>/dev/null; true

run: kill-port
	dotnet run --project Nudge.API --urls http://localhost:5000

watch: kill-port
	dotnet watch run --project Nudge.API --urls http://localhost:5000

dev: kill-port
	@trap 'kill 0' EXIT; \
	dotnet run --project Nudge.API --urls http://localhost:5000 & \
	cd nudge-mobile && npx expo start --web; \
	wait

native: kill-port
	@trap 'kill 0' EXIT; \
	dotnet run --project Nudge.API --urls http://0.0.0.0:5000 & \
	cd nudge-mobile && EXPO_PUBLIC_API_URL=http://192.168.0.190:5000 npx expo start --lan; \
	wait
