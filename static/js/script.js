function submitPrompt(index) {
    // Find the input field and set its value to the selected prompt index
    const inputField = document.querySelector('#user-input');
    const form = inputField.closest('form');

    // Create a hidden field to store the prompt index value
    const promptIndexField = document.createElement('input');
    promptIndexField.setAttribute('type', 'hidden');
    promptIndexField.setAttribute('name', 'prompt_index');
    promptIndexField.setAttribute('value', index);

    // Ensure that the form hasn't already been submitted (optional safeguard)
    if (!form.querySelector('input[name="prompt_index"]')) {
        form.appendChild(promptIndexField);
        form.submit();
    }
}
