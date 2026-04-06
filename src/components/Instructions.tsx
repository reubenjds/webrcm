interface InstructionsProps {
  defaultOpen?: boolean;
}

export function Instructions({ defaultOpen = false }: InstructionsProps) {
  const steps = [
    {
      title: 'Enter RCM Mode',
      description:
        'Insert your RCM jig into the right Joy-Con rail and hold Volume Up while pressing Power.',
    },
    {
      title: 'Connect to Computer',
      description:
        'Connect your Switch to your computer using a USB-C cable. The screen should remain black.',
    },
    {
      title: 'Select Payload',
      description:
        'Choose Hekate, Atmosphere, or upload your own custom payload file.',
    },
    {
      title: 'Launch',
      description:
        'Click "Launch Payload" and select the APX device when prompted by your browser.',
    },
    {
      title: 'Done!',
      description:
        'Your payload should now be running. If using Hekate, you can boot CFW from its menu.',
    },
  ];

  return (
    <div className="collapse collapse-arrow bg-base-200 rounded-lg">
      <input type="checkbox" defaultChecked={defaultOpen} />
      <div className="collapse-title text-lg font-medium">
        Instructions
      </div>
      <div className="collapse-content">
        <ul className="steps steps-vertical">
          {steps.map((step, index) => (
            <li key={index} className="step" data-content={index + 1}>
              <div className="text-left ml-4">
                <h4 className="font-medium text-base text-base-content/90">{step.title}</h4>
                <p className="text-sm text-base-content/60 py-1">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
