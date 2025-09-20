import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	setIcon,
} from "obsidian";

interface TranscribePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: TranscribePluginSettings = {
	mySetting: "default",
};

export default class TranscribePlugin extends Plugin {
	settings: TranscribePluginSettings;
	private isRunning: boolean = false;

	async onload() {
		await this.loadSettings();

		let isTranscribing: boolean = false;

		// ----------------- Ribbon button
		const transcribeRibbonIcon = this.addRibbonIcon(
			"mic-off",
			"Transcribe",
			(_evt: MouseEvent) => {
				if (isTranscribing) {
					// Stop transcribing
					this.stopTranscribing();
					new Notice("Stopped transcribing.");
					isTranscribing = false;
					// Update icon and tooltip for start state
					setIcon(transcribeRibbonIcon, "mic-off");
					transcribeRibbonIcon.setAttribute(
						"aria-label",
						"Start Listening"
					);
				} else {
					// Start transcribing
					this.startTranscribing();
					new Notice("Started transcribing.");
					isTranscribing = true;
					// Update icon and tooltip for stop state
					setIcon(transcribeRibbonIcon, "mic");
					transcribeRibbonIcon.setAttribute(
						"aria-label",
						"Stop Listening"
					);
				}
			}
		);

		// ----------------- Commands
		transcribeRibbonIcon.id = "transcribe-ribbon-icon";

		// Start transcribing command
		this.addCommand({
			id: "start-transcribing-command",
			name: "Start Transcribing",
			callback: () => {
				if (!isTranscribing) {
					// Start transcribing
					this.startTranscribing();
					new Notice("Started transcribing.");
					isTranscribing = true;
					// Update icon and tooltip for stop state
					setIcon(transcribeRibbonIcon, "mic");
					transcribeRibbonIcon.setAttribute(
						"aria-label",
						"Stop Listening"
					);
				}
			},
		});

		// Stop transcribing command
		this.addCommand({
			id: "stop-transcribing-command",
			name: "Stop Transcribing",
			callback: () => {
				if (isTranscribing) {
					// Stop transcribing
					this.stopTranscribing();
					new Notice("Stopped transcribing.");
					isTranscribing = false;
					// Update icon and tooltip for start state
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

	private async startTranscribing() {
		if (this.isRunning) {
			return;
		}

		this.isRunning = true;
		this.runLoop();
	}

	private async runLoop() {
		while (this.isRunning) {
			// Transcription loop

			const activeLeaf =
				this.app.workspace.getActiveViewOfType(MarkdownView);

			if (activeLeaf) {
				const editor = activeLeaf.editor;
				editor.setValue("Hello, world!");
			}

			// Small delay to prevent blocking I could not get it to work without this delay for some reason
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	private stopTranscribing() {
		this.isRunning = false;
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
