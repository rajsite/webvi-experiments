# HandDrawn

Early Work In Progress

## Development notes

- Wired Element button does not use element height and width. Creates a button internally and sizes to text content. Requires modifying the shadowroot and appending new styles to make respect container size.

- ChartXkcd line chart creating a new line chart with data, updating the data on the linechart instance, and calling render does not remove previous lines. Seems like the chart needs to be recreated for each update.
