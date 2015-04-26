new OWL.Requirement({
	require: 'StringExtras',
	thenDo: function () {
		String.addLocalizedStrings({
			'Select Preset': 'Select Preset',
			'Preset Date': 'Preset Date',
			'Today': 'Today',
			'Yesterday': 'Yesterday',
			'Last %d days': 'Last %d days',
			'This week': 'This week',
			'Last week': 'Last week',
			'Last %d weeks': 'Last %d weeks',
			'This month': 'This month',
			'Last month': 'Last month',
			'Last %d months': 'Last %d months',
			'This year': 'This year',
			'Last year': 'Last year',
			'Recent Date Ranges': 'Recent Date Ranges',
			'to': 'to',
			'1 day': '1 day',
			'%d days': '%d days',
			'1 week': '1 week',
			'%d weeks': '%d weeks',
			'1 month': '1 month',
			'%d months': '%d months',
			'1 year': '1 year',
			'%d years': '%d years',
			'1 quarter': '1 quarter',
			'%d quarters': '%d quarters'
		});

		OWL.Requirement.met('Localization.QuickDates');
	}
});
