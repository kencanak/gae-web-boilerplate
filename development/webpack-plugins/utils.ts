import * as fs from 'fs';
import * as path from 'path';


export const DIST_FOLDER = 'dist';
export const SRC_FOLDER = './src';
export const MANIFEST_PATH = path.join(__dirname, '..', DIST_FOLDER, 'manifest.json');

const pagesPath = path.join('.', SRC_FOLDER, 'pages');

export const ASSETS = [
  'images',
];

const processPages = (file: any, regex: any) => {
	// obtain page absolute path, this is with the assumption
	// that the code structure will be pages > page_name > file
	// check if it's a directory
	const pagePath = path.join(pagesPath, file);
	const pageStat = fs.statSync(pagePath);
	let files: any = [];
	if (pageStat.isDirectory()) {
		const pageFiles = fs.readdirSync(pagePath);

		pageFiles.forEach((fileName) => {
			const subPageStat= fs.statSync(path.join(pagePath, fileName));

			if (subPageStat.isDirectory()) {
				const getSubPages = processPages(path.join(file, fileName), regex);
				files = [...files, ...getSubPages.map((item: any) => item)];
			} else if (fileName.match(regex)) {
				const temp = `./${pagesPath}/${file}/${fileName}`;

				files.push({
					// file would be the page folder name
					name: file,
					entry: temp,
				});
			}
		});
	}

	return files;
};

export const getPageFiles = (regex: any) => {
	let files: any = [];
	fs.readdirSync(pagesPath)
		.forEach((file) => {
			files = [...files, ...processPages(file, regex)];
		});

	return files;
}

export const getPageJSEntries = () => {
	const pageJS: Array<any> = getPageFiles(/(.*?)\.(js|ts)$/);

	return pageJS.map((item) => {
		return {
			// file would be the page folder name
			name: item.name,
			entry: item.entry.replace('.ts', ''),
      type: 'js',
		}
  });
}

export const getPageCSSEntries = () => {
	const pageCSS: Array<any> = getPageFiles(/.*\.scss$/);

	return pageCSS.map((item) => {
		return {
      name: item.name,
			entry: item.entry,
      type: 'css',
		}
	});
};

export const getEntries = () => {
  const pageJS = getPageJSEntries();
  const pageCSS = getPageCSSEntries();

  const temp = [...pageJS, ...pageCSS];

  return temp.reduce((memo: any, file) => {
    if (file) {
      if (!memo[file.name]) {
        memo[file.name] = [];
      }
      memo[file.name].push(file.entry);
      return memo;
    }
  }, {});
}

// we should compile base and detect component by default
export const ENTRIES = {
  'base': [
    './src/base.ts',
    './src/base.scss',
  ],
  ...getEntries(),
};