import {
	App,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	setIcon,
	normalizePath,
} from "obsidian";

import { spawn, ChildProcessWithoutNullStreams } from "child_process";

interface TranscribePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: TranscribePluginSettings = {
	mySetting: "default",
};

export default class TranscribePlugin extends Plugin {
	settings: TranscribePluginSettings;
	private isRunning: boolean = false;
	private pythonProcess: ChildProcessWithoutNullStreams | null = null;

	async onload() {
		await this.loadSettings();

		let isTranscribing: boolean = false;

		const transcribeRibbonIcon = this.addRibbonIcon(
			"mic-off",
			"Transcribe",
			() => {
				if (isTranscribing) {
					this.stopTranscribing();
					new Notice("Stopped transcribing.");
					isTranscribing = false;
					setIcon(transcribeRibbonIcon, "mic-off");
					transcribeRibbonIcon.setAttribute(
						"aria-label",
						"Start Listening"
					);
				} else {
					this.startTranscribing();
					new Notice("Started transcribing.");
					isTranscribing = true;
					setIcon(transcribeRibbonIcon, "mic");
					transcribeRibbonIcon.setAttribute(
						"aria-label",
						"Stop Listening"
					);
				}
			}
		);

		transcribeRibbonIcon.id = "transcribe-ribbon-icon";

		this.addCommand({
			id: "start-transcribing-command",
			name: "Start Transcribing",
			callback: () => {
				if (!isTranscribing) {
					this.startTranscribing();
					new Notice("Started transcribing.");
					isTranscribing = true;
					setIcon(transcribeRibbonIcon, "mic");
					transcribeRibbonIcon.setAttribute(
						"aria-label",
						"Stop Listening"
					);
				}
			},
		});

		this.addCommand({
			id: "stop-transcribing-command",
			name: "Stop Transcribing",
			callback: () => {
				if (isTranscribing) {
					this.stopTranscribing();
					new Notice("Stopped transcribing.");
					isTranscribing = false;
					setIcon(transcribeRibbonIcon, "mic-off");
					transcribeRibbonIcon.setAttribute(
						"aria-label",
						"Start Listening"
					);
				}
			},
		});
	}

	onunload() {
		this.stopTranscribing();
	}

	private startTranscribing() {
		if (this.isRunning) return;
		this.isRunning = true;

		const vaultPath = (this.app.vault.adapter as any).basePath;
		const pluginPath = normalizePath(
			vaultPath + "/.obsidian/plugins/transcribe"
		);
		const pythonFilePath = pluginPath + "/index.py";

		this.pythonProcess = spawn("python", [pythonFilePath]);

		this.pythonProcess.stdout.on("data", (data: Buffer) => {
			const text = data.toString().trim();
			if (!text) return;

			console.log("Python: ", text);
		});

		this.pythonProcess.stderr.on("data", (data) => {
			console.error("Python stderr:", data.toString());
		});

		this.pythonProcess.on("close", (code) => {
			console.log(`Python process exited with code ${code}`);
			this.isRunning = false;
			this.pythonProcess = null;
		});
	}

	private stopTranscribing() {
		this.isRunning = false;
		if (this.pythonProcess) {
			this.pythonProcess.kill();
			this.pythonProcess = null;
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
