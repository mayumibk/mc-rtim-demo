new OWL.Requirement({
	require: 'StringExtras',
	thenDo: function () {
		String.addLocalizedStrings({
			'Run Report': 'Run Report',
			'Cancel': 'Cancel',
			'Select': 'Select',
			'Compare Dates': 'Compare Dates',
			'Compare these dates (left column):': 'Compare these dates (left column):',
			'With these dates (right column):': 'With these dates (right column):',
			'View by:': 'View by:',
			'Hour': 'Hour',
			'Day': 'Day',
			'Week': 'Week',
			'Month': 'Month',
			'Quarter': 'Quarter',
			'Year': 'Year',
			'Hourly granularity can only be selected for a maximum of 14 days.': 'Hourly granularity can only be selected for a maximum of 14 days.',
			'Daily granularity can only be selected for a maximum of 2 years.': 'Daily granularity can only be selected for a maximum of 2 years.',
			'Tip: You can click and drag to select.': 'Tip: Click and drag or use shift+click to select a range.'
		});

		OWL.Requirement.met('Localization.CalendarWidget');
	}
});
